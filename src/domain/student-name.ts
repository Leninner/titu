export function shortName(fullName: string) {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  return words.length >= 3 ? `${words[0]} ${words[words.length - 2]}` : words.join(' ')
}
