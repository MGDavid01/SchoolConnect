/**
 * Utilidades para el manejo de texto en la aplicación
 */

/**
 * Trunca un texto a una longitud máxima especificada
 * @param text - El texto a truncar
 * @param maxLength - La longitud máxima permitida (por defecto 150 caracteres)
 * @returns El texto truncado con "..." si es necesario
 */
export const truncateText = (text: string, maxLength: number = 150): string => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

/**
 * Trunca un texto para mostrar en tarjetas de noticias
 * @param text - El texto a truncar
 * @returns El texto truncado para tarjetas
 */
export const truncateForCard = (text: string): string => {
  return truncateText(text, 120)
}

/**
 * Trunca un texto para mostrar en títulos
 * @param text - El texto a truncar
 * @returns El texto truncado para títulos
 */
export const truncateForTitle = (text: string): string => {
  return truncateText(text, 80)
}

/**
 * Verifica si un texto necesita ser truncado
 * @param text - El texto a verificar
 * @param maxLength - La longitud máxima permitida
 * @returns true si el texto necesita ser truncado
 */
export const needsTruncation = (text: string, maxLength: number = 150): boolean => {
  return text && text.length > maxLength
} 