// ===========================================
// Stamps Controller
// ===========================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { Prisma } from '@prisma/client';

/**
 * Helper to format a stamp record into the frontend-expected shape
 */
function formatStamp(stamp: any) {
  return {
    id: stamp.id,
    article: stamp.article,
    name: stamp.name,
    series: stamp.series,
    category_id: stamp.category?.slug || stamp.categoryId,
    price: stamp.price,
    size: stamp.size,
    shape: stamp.shape,
    images: {
      main: stamp.imageMain || '',
      gallery: stamp.imageGallery || [],
      impression: stamp.imageImpression || '',
    },
    ink_pad: stamp.inkPad,
    features: {
      mci: stamp.featureMci,
      eco: stamp.featureEco,
      positioning: stamp.featurePositioning,
    },
    colors: stamp.colors,
    ink_colors: stamp.inkColors,
    description: stamp.description,
    in_stock: stamp.inStock,
    created_at: stamp.createdAt?.toISOString?.() || stamp.createdAt,
    max_lines: stamp.maxLines,
    max_chars: stamp.maxChars,
  };
}

/**
 * GET /api/v1/stamps
 * Supports: search, series, shape, category_id, in_stock_only,
 *           min_price, max_price, sort, page, per_page
 */
export const getStamps = async (req: Request, res: Response) => {
  const {
    search,
    series,
    shape,
    category_id,
    in_stock_only,
    min_price,
    max_price,
    sort,
    page = '1',
    per_page = '12',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const perPage = Math.max(1, Math.min(50, parseInt(per_page as string, 10)));

  // Build the where clause
  const where: Prisma.StampWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { article: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (series) {
    const seriesArr = (series as string).split(',').filter(Boolean);
    if (seriesArr.length > 0) {
      where.series = { in: seriesArr };
    }
  }

  if (shape) {
    const shapeArr = (shape as string).split(',').filter(Boolean);
    if (shapeArr.length > 0) {
      where.shape = { in: shapeArr };
    }
  }

  if (category_id && category_id !== 'all') {
    where.category = { slug: category_id as string };
  }

  if (in_stock_only === 'true') {
    where.inStock = true;
  }

  if (min_price) {
    where.price = { ...((where.price as any) || {}), gte: parseInt(min_price as string, 10) };
  }

  if (max_price) {
    where.price = { ...((where.price as any) || {}), lte: parseInt(max_price as string, 10) };
  }

  // Build the order clause
  let orderBy: Prisma.StampOrderByWithRelationInput = { createdAt: 'desc' };
  switch (sort) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'name_asc':
      orderBy = { name: 'asc' };
      break;
  }

  // Execute query
  const [stamps, total] = await Promise.all([
    prisma.stamp.findMany({
      where,
      orderBy,
      skip: (pageNum - 1) * perPage,
      take: perPage,
      include: { category: true },
    }),
    prisma.stamp.count({ where }),
  ]);

  res.json({
    data: stamps.map(formatStamp),
    meta: {
      total,
      page: pageNum,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    },
  });
};

/**
 * GET /api/v1/stamps/:id
 */
export const getStamp = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const stamp = await prisma.stamp.findFirst({
    where: {
      OR: [{ id }, { article: id }],
    },
    include: { category: true },
  });

  if (!stamp) {
    throw ApiError.notFound('Stamp not found');
  }

  res.json(formatStamp(stamp));
};

/**
 * GET /api/v1/stamps/series/:series
 */
export const getStampsBySeries = async (req: Request, res: Response) => {
  const series = req.params.series as string;

  const stamps = await prisma.stamp.findMany({
    where: { series },
    include: { category: true },
  });

  res.json({
    data: stamps.map(formatStamp),
    meta: {
      total: stamps.length,
      page: 1,
      per_page: 50,
      last_page: 1,
    },
  });
};

/**
 * GET /api/v1/stamps/search?q=...
 */
export const searchStamps = async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q) {
    res.json([]);
    return;
  }

  const stamps = await prisma.stamp.findMany({
    where: {
      OR: [
        { name: { contains: q as string, mode: 'insensitive' } },
        { article: { contains: q as string, mode: 'insensitive' } },
      ],
    },
    take: 20,
    include: { category: true },
  });

  res.json(stamps.map(formatStamp));
};

/**
 * GET /api/v1/stamps/:id/ink-pads
 */
export const getInkPads = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const stamp = await prisma.stamp.findFirst({
    where: { OR: [{ id }, { article: id }] },
  });

  if (!stamp) {
    throw ApiError.notFound('Stamp not found');
  }

  const pads = stamp.inkColors.map((color, i) => ({
    article: `${stamp.inkPad}-${color}`,
    colors: [color],
    type: 'standard',
    price: 290 + i * 50,
    image: '',
  }));

  res.json(pads);
};

/**
 * POST /api/v1/stamps
 */
export const createStamp = async (req: Request, res: Response) => {
  const data = req.body;

  // Handle category_id (could be slug or UUID)
  let categoryId = data.category_id || 'text-stamps';
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { id: categoryId },
        { slug: categoryId }
      ]
    }
  });
  
  if (category) {
    categoryId = category.id;
  } else {
    // If category not found, use any existing one to prevent 500
    const fallback = await prisma.category.findFirst();
    if (fallback) categoryId = fallback.id;
  }

  const stamp = await prisma.stamp.create({
    data: {
      article: data.article || `ART-${Date.now()}`,
      name: data.name || 'Unnamed Stamp',
      series: data.series || 'printy',
      price: Number(data.price) || 0,
      size: data.size || '47x18mm',
      shape: data.shape || 'rectangle',
      inkPad: data.ink_pad || '6/4911',
      description: data.description || '',
      inStock: data.in_stock ?? true,
      imageMain: data.images?.main || '',
      categoryId: categoryId,
      colors: data.colors || ['Black'],
      inkColors: data.ink_colors || ['Black'],
    },
    include: { category: true },
  });
  res.status(201).json(formatStamp(stamp));
};

/**
 * PUT /api/v1/stamps/:id
 */
export const updateStamp = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = req.body;
  
  // Handle category_id (could be slug or UUID)
  let categoryId = data.category_id;
  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id: categoryId },
          { slug: categoryId }
        ]
      }
    });
    if (category) categoryId = category.id;
  }

  const stamp = await prisma.stamp.update({
    where: { id },
    data: {
      article: data.article,
      name: data.name,
      series: data.series,
      price: data.price !== undefined ? Number(data.price) : undefined,
      size: data.size,
      shape: data.shape,
      inkPad: data.ink_pad,
      description: data.description,
      inStock: data.in_stock,
      imageMain: data.images?.main || undefined,
      categoryId: categoryId,
      colors: data.colors,
      inkColors: data.ink_colors,
    },
    include: { category: true },
  });
  res.json(formatStamp(stamp));
};

/**
 * DELETE /api/v1/stamps/:id
 */
export const deleteStamp = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await prisma.stamp.delete({
    where: { id },
  });
  res.status(204).send();
};
