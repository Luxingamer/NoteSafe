// Clé de chiffrement par défaut (à remplacer par une clé sécurisée en production)
const DEFAULT_KEY = 'NoteSafe_SecureKey_2024';

/**
 * Chiffre une chaîne de caractères
 * @param text Le texte à chiffrer
 * @param key La clé de chiffrement (optionnelle)
 * @returns Le texte chiffré
 */
export function encrypt(text: string, key: string = DEFAULT_KEY): string {
  try {
    // Convertir le texte en tableau de bytes
    const textBytes = new TextEncoder().encode(text);
    
    // Créer un hash de la clé
    const keyBytes = new TextEncoder().encode(key);
    const keyHash = Array.from(keyBytes).reduce((hash, byte) => ((hash << 5) - hash + byte) | 0, 0);
    
    // Chiffrer chaque byte avec XOR et le hash de la clé
    const encryptedBytes = Array.from(textBytes).map((byte, index) => {
      const keyByte = (keyHash >> (index % 32)) & 0xFF;
      return byte ^ keyByte;
    });
    
    // Convertir en base64
    return btoa(String.fromCharCode(...encryptedBytes));
  } catch (error) {
    console.error('Erreur lors du chiffrement:', error);
    return text;
  }
}

/**
 * Déchiffre une chaîne de caractères
 * @param encryptedText Le texte chiffré
 * @param key La clé de chiffrement (optionnelle)
 * @returns Le texte déchiffré
 */
export function decrypt(encryptedText: string, key: string = DEFAULT_KEY): string {
  try {
    // Convertir de base64 en tableau de bytes
    const encryptedBytes = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    
    // Créer un hash de la clé
    const keyBytes = new TextEncoder().encode(key);
    const keyHash = Array.from(keyBytes).reduce((hash, byte) => ((hash << 5) - hash + byte) | 0, 0);
    
    // Déchiffrer chaque byte avec XOR et le hash de la clé
    const decryptedBytes = Array.from(encryptedBytes).map((byte, index) => {
      const keyByte = (keyHash >> (index % 32)) & 0xFF;
      return byte ^ keyByte;
    });
    
    // Convertir en texte
    return new TextDecoder().decode(new Uint8Array(decryptedBytes));
  } catch (error) {
    console.error('Erreur lors du déchiffrement:', error);
    return encryptedText;
  }
}

/**
 * Vérifie si une chaîne est chiffrée
 * @param text Le texte à vérifier
 * @returns true si le texte semble être chiffré
 */
export function isEncrypted(text: string): boolean {
  try {
    const decoded = atob(text);
    return decoded.length > 0;
  } catch {
    return false;
  }
} 