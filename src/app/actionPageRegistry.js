const pageModules = import.meta.glob('../pages/*/*-page.jsx', { eager: true })

export const actionPageMap = Object.entries(pageModules).reduce((acc, [file, mod]) => {
  if (file.includes('/auth/')) return acc
  const match = file.match(/\.\.\/pages\/([^/]+)\/([^/]+)-page\.jsx$/)
  if (!match) return acc
  const [, area, slug] = match
  acc[`/${area}/${slug}`] = mod.default
  return acc
}, {})
