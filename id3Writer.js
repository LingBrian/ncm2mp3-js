const ID3Writer = (function() {
    function encodeSize(size) {
        const bytes = new Uint8Array(4);
        bytes[0] = (size >> 21) & 0x7F;
        bytes[1] = (size >> 14) & 0x7F;
        bytes[2] = (size >> 7) & 0x7F;
        bytes[3] = size & 0x7F;
        return bytes;
    }
    
    function stringToBytes(str, encoding) {
        if (encoding === 0x01) {
            const utf16 = [];
            utf16.push(0xFE, 0xFF);
            for (let i = 0; i < str.length; i++) {
                const code = str.charCodeAt(i);
                utf16.push((code >> 8) & 0xFF);
                utf16.push(code & 0xFF);
            }
            return new Uint8Array(utf16);
        } else {
            return new TextEncoder().encode(str);
        }
    }
    
    function createTextFrame(identifier, text) {
        const textBytes = stringToBytes(text, 0x01);
        const frameData = new Uint8Array(1 + textBytes.length);
        frameData[0] = 0x01;
        frameData.set(textBytes, 1);
        
        const frame = new Uint8Array(10 + frameData.length);
        const idBytes = new TextEncoder().encode(identifier);
        frame.set(idBytes, 0);
        
        const sizeBytes = new Uint8Array(4);
        sizeBytes[0] = (frameData.length >> 24) & 0xFF;
        sizeBytes[1] = (frameData.length >> 16) & 0xFF;
        sizeBytes[2] = (frameData.length >> 8) & 0xFF;
        sizeBytes[3] = frameData.length & 0xFF;
        frame.set(sizeBytes, 4);
        
        frame.set(frameData, 10);
        
        return frame;
    }
    
    function createAPICFrame(imageBuffer, mimeType, pictureType, description) {
        mimeType = mimeType || 'image/jpeg';
        pictureType = pictureType || 0x03;
        description = description || '';
        
        const mimeBytes = new TextEncoder().encode(mimeType);
        const descBytes = stringToBytes(description, 0x00);
        
        const frameData = new Uint8Array(1 + mimeBytes.length + 1 + 1 + descBytes.length + imageBuffer.length);
        let offset = 0;
        
        frameData[offset++] = 0x00;
        frameData.set(mimeBytes, offset);
        offset += mimeBytes.length;
        frameData[offset++] = 0x00;
        frameData[offset++] = pictureType;
        frameData.set(descBytes, offset);
        offset += descBytes.length;
        frameData.set(imageBuffer, offset);
        
        const frame = new Uint8Array(10 + frameData.length);
        const idBytes = new TextEncoder().encode('APIC');
        frame.set(idBytes, 0);
        
        const sizeBytes = new Uint8Array(4);
        sizeBytes[0] = (frameData.length >> 24) & 0xFF;
        sizeBytes[1] = (frameData.length >> 16) & 0xFF;
        sizeBytes[2] = (frameData.length >> 8) & 0xFF;
        sizeBytes[3] = frameData.length & 0xFF;
        frame.set(sizeBytes, 4);
        
        frame.set(frameData, 10);
        
        return frame;
    }
    
    function getMimeType(buffer) {
        if (buffer.length > 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
            return 'image/jpeg';
        }
        if (buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
            return 'image/png';
        }
        return 'image/jpeg';
    }
    
    function write(tags, audioData) {
        const frames = [];
        
        if (tags.title) {
            frames.push(createTextFrame('TIT2', tags.title));
        }
        if (tags.artist) {
            frames.push(createTextFrame('TPE1', tags.artist));
        }
        if (tags.album) {
            frames.push(createTextFrame('TALB', tags.album));
        }
        if (tags.year) {
            frames.push(createTextFrame('TYER', tags.year.toString()));
        }
        if (tags.genre) {
            frames.push(createTextFrame('TCON', tags.genre));
        }
        if (tags.image && tags.image.imageBuffer) {
            const mimeType = tags.image.mime || getMimeType(tags.image.imageBuffer);
            const pictureType = tags.image.type && tags.image.type.id !== undefined ? tags.image.type.id : 0x03;
            const description = tags.image.description || '';
            frames.push(createAPICFrame(tags.image.imageBuffer, mimeType, pictureType, description));
        }
        
        const framesData = new Uint8Array(frames.reduce((sum, f) => sum + f.length, 0));
        let offset = 0;
        for (const frame of frames) {
            framesData.set(frame, offset);
            offset += frame.length;
        }
        
        const header = new Uint8Array(10);
        header[0] = 0x49;
        header[1] = 0x44;
        header[2] = 0x33;
        header[3] = 0x03;
        header[4] = 0x00;
        header[5] = 0x00;
        header.set(encodeSize(framesData.length), 6);
        
        const result = new Uint8Array(10 + framesData.length + audioData.length);
        result.set(header, 0);
        result.set(framesData, 10);
        result.set(audioData, 10 + framesData.length);
        
        return result;
    }
    
    return {
        write: write
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ID3Writer;
}
