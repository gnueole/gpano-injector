(function (window) {
    // --- util.js content ---
    function uuidv4(crypto) {
        return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
            (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
        )
    }

    function dataURLToArrayBuffer(dataURL) {
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

    function arrayBufferToBase64(buffer) {
        let binary = ''
        const bytes = new Uint8Array(buffer)
        const len = bytes.byteLength
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i])
        }

        const base64 = btoa(binary)
        return base64
    }

    function arrayBufferToDataURL(buffer, mimeType = 'image/jpeg') {
        const base64 = arrayBufferToBase64(buffer)
        return `data:${mimeType};base64,${base64}`
    }

    function isOject(variable) {
        return typeof variable === 'object' && variable !== null && !Array.isArray(variable)
    }

    // --- writer.js content ---
    const template = `<root><x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.5-c002 1.148022, 2012/07/15-18:06:45        ">
        <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/" 
                xmlns:xmpMM="http://ns.adobe.com/xap/1.0/mm/" xmlns:stEvt="http://ns.adobe.com/xap/1.0/sType/ResourceEvent#" 
                xmlns:stRef="http://ns.adobe.com/xap/1.0/sType/ResourceRef#">
            </rdf:Description>
        </rdf:RDF>
    </x:xmpmeta></root>`

    function writeXMP(buffer, DOMProcessorOrPropMap, Parser = null, serializer = null, crypto = null) {
        let useInnerHTML = false

        if (!Parser && typeof DOMParser !== 'undefined') {
            Parser = DOMParser
        }

        if (!serializer && typeof DOMParser !== 'undefined') {
            useInnerHTML = true
        }

        if (!serializer && !useInnerHTML) {
            throw new Error('No serializer argument provided and no DOMParser available.')
        }

        if (!Parser) {
            throw new Error('No parser argument provided and no DOMParser available.')
        }

        if (!crypto && typeof window !== 'undefined') {
            crypto = window.crypto
        }

        if (!crypto) {
            throw new Error('No crypto argument provided and no window.crypto available.')
        }

        let xmp = (new Parser()).parseFromString(template, 'text/xml').documentElement
        const descriptionNode = xmp.getElementsByTagName('rdf:Description')[0]

        if (isOject(DOMProcessorOrPropMap)) {
            Object.entries(DOMProcessorOrPropMap).forEach(([attribute, value]) => {
                descriptionNode.setAttribute(attribute, value)
            })
        } else if (typeof DOMProcessorOrPropMap === 'function') {
            xmp = DOMProcessorOrPropMap(xmp)
        }

        const xmpString = useInnerHTML ? xmp.innerHTML : serializer(xmp.firstChild)

        // insert it
        const dvIn = new DataView(buffer)
        const pos = 4 + dvIn.getUint16(4) // get length of APP0 segment
        const encodedPayload = new TextEncoder().encode(
            'XXXX' + // APP1 marker and length will go here
            'http://ns.adobe.com/xap/1.0/\0' +
            '<?xpacket begin="XX" id="' + uuidv4(crypto) + '"?>' +
            xmpString +
            (' '.repeat(100) + '\n').repeat(10) + // 1k padding
            '<?xpacket end="w"?>'
        )

        // DataView lets us treat our buffer as whatever data type we like,
        // So we can assign 2 byte integers at the start of our utf8 encoded stream...
        const dvOut = new DataView(encodedPayload.buffer)
        // APP1 marker
        dvOut.setUint16(0, 0xFFE1)
        // length of packet as 2 byte integer, in bytes 2 & 3.
        dvOut.setUint16(2, encodedPayload.buffer.byteLength - 2) // APP1 marker not counted in length
        // begin="0xFEFF", byte order marker
        dvOut.setUint16(50, 0xFEFF)

        const inArr = new Uint8Array(buffer)
        const outBuffer = new ArrayBuffer(inArr.length + encodedPayload.length)
        const outArr = new Uint8Array(outBuffer)
        outArr.set(inArr.subarray(0, pos)) // APP0 segment, 20 bytes
        outArr.set(encodedPayload, pos) // Our XMP payload
        outArr.set(inArr.subarray(pos), pos + encodedPayload.length)// Rest of image

        return outArr
    }

    // Expose to window
    window.writeXMP = writeXMP;

})(window);
