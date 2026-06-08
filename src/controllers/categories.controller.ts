// ===========================================
// Categories Controller
// ===========================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

/**
 * GET /api/v1/categories
 */
export const getCategories = async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  res.json({
    data: categories.map((cat) => ({
      id: cat.slug,
      name: cat.name,
      series: cat.series,
      icon: cat.icon,
    }))
  });
};

/**
 * GET /api/v1/categories/:slug/stamps
 */
export const getStampsByCategory = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  const where = slug === 'all'
    ? {}
    : { category: { slug } };

  const stamps = await prisma.stamp.findMany({
    where: where as any,
    include: { category: true },
  });

  res.json({
    data: stamps.map((stamp) => ({
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
      created_at: stamp.createdAt.toISOString(),
      max_lines: stamp.maxLines,
      max_chars: stamp.maxChars,
    })),
    meta: {
      total: stamps.length,
      page: 1,
      per_page: 50,
      last_page: 1,
    },
  });
};
