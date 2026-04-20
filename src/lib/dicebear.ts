import { DICE_BEAR_BASE_URL } from '@/types'

/**
 * Genera una URL de avatar de DiceBear usando un seed
 */
export function getAvatarUrl(seed: string): string {
  return `${DICE_BEAR_BASE_URL}?seed=${encodeURIComponent(seed)}`
}

/**
 * Genera un array de seeds aleatorias para mostrar en el selector
 */
export function generateRandomSeeds(count: number = 10): string[] {
  const seeds: string[] = []
  
  for (let i = 0; i < count; i++) {
    // Generar seed aleatoria con prefijo + random string
    const randomPart = Math.random().toString(36).substring(2, 8)
    const timestamp = Date.now().toString(36).substring(0, 4)
    seeds.push(`avatar-${timestamp}-${randomPart}`)
  }
  
  return seeds
}

/**
 * Genera un seed único para un nuevo avatar
 */
export function generateUniqueSeed(prefix: string = 'user'): string {
  const randomPart = Math.random().toString(36).substring(2, 10)
  const timestamp = Date.now().toString(36)
  return `${prefix}-${timestamp}-${randomPart}`
}

/**
 * Verifica si un string parece ser un seed de DiceBear
 * (contiene caracteres válidos para URLs y no es un emoji)
 */
export function isDiceBearSeed(value: string | undefined): boolean {
  if (!value) return false
  // Seeds no contienen emojis typical unicode
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
  return !emojiRegex.test(value) && value.length > 5
}

/**
 * Obtiene la URL del avatar - determina si es emoji o DiceBear seed
 */
export function resolveAvatarUrl(avatar: string | undefined, seed: string | undefined): string {
  // Si hay un seed, usar DiceBear
  if (seed) {
    return getAvatarUrl(seed)
  }
  
  // Si no hay seed pero hay avatar, verificar si es emoji o DiceBear
  if (avatar) {
    if (isDiceBearSeed(avatar)) {
      // El avatar ya es un seed
      return getAvatarUrl(avatar)
    }
    // Es un emoji, retornarlo tal cual
    return avatar
  }
  
  // Fallback:种子por defecto
  return getAvatarUrl('default')
}
