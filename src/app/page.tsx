import PageTemplate, { generateMetadata } from './(pages)/[slug]/page'

// Force dynamic rendering for home page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default PageTemplate

export { generateMetadata }
