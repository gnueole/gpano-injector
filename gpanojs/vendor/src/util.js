// 💪 https://stackoverflow.com/a/2117523/8797350
export function uuidv4 (crypto) {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  )
}

export function dataURLToArrayBuffer (dataURL) {
  const base64Marker = ';base64,'
  const base64Index = dataURL.indexOf(base64Marker) + base64Marker.length
  const base64 = dataURL.substring(base64Index)

  const raw = atob(base64)

  const rawLength = raw.length
  const arrayBuffer = new ArrayBuffer(rawLength)
  const uint8Array = new Uint8Array(arrayBuffer)
  for (let i = 0; i < rawLength; i++) {
    uint8Array[i] = raw.charCodeAt(i)
  }

  return arrayBuffer
}

function arrayBufferToBase64 (buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  const base64 = btoa(binary)
  return base64
}

export function arrayBufferToDataURL (buffer, mimeType = 'image/jpeg') {
  const base64 = arrayBufferToBase64(buffer)
  return `data:${mimeType};base64,${base64}`
}

export function isOject (variable) {
  return typeof variable === 'object' && variable !== null && !Array.isArray(variable)
}
