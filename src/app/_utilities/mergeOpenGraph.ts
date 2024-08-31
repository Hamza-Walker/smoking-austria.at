import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  siteName: 'Smoking-Austria E-Commerce',
  title: 'Smoking-Austria',
  description:
    'Smoking-Austria offers a variety of rolling papers, cones, filters, tubes and accessories for all types of tobacco and cannabis.',
  images: [
    {
      url: 'https://www.smokingpaper.com/wp-content/uploads/2021/11/smoking-logo.svg',
    },
  ],
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
