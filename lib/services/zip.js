// Minimal, dependency-free ZIP writer using the "stored" (no compression) method.
// PDFs are already compressed, so storing them verbatim keeps things fast and simple.

let crcTable = null

function makeCrcTable() {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
}

function crc32(buf) {
  if (!crcTable) crcTable = makeCrcTable()
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

// files: [{ name: string, data: Buffer }]
export function createZip(files) {
  const localChunks = []
  const centralChunks = []
  const records = []
  let offset = 0

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8')
    const data = file.data
    const crc = crc32(data)
    const size = data.length

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0) // local file header signature
    local.writeUInt16LE(20, 4) // version needed
    local.writeUInt16LE(0x0800, 6) // flags (UTF-8 filename)
    local.writeUInt16LE(0, 8) // method = store
    local.writeUInt16LE(0, 10) // mod time
    local.writeUInt16LE(0, 12) // mod date
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(size, 18) // compressed size
    local.writeUInt32LE(size, 22) // uncompressed size
    local.writeUInt16LE(nameBuf.length, 26)
    local.writeUInt16LE(0, 28) // extra length

    localChunks.push(local, nameBuf, data)
    records.push({ nameBuf, crc, size, offset })
    offset += local.length + nameBuf.length + data.length
  }

  let centralSize = 0
  for (const rec of records) {
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0) // central dir signature
    central.writeUInt16LE(20, 4) // version made by
    central.writeUInt16LE(20, 6) // version needed
    central.writeUInt16LE(0x0800, 8) // flags (UTF-8 filename)
    central.writeUInt16LE(0, 10) // method = store
    central.writeUInt16LE(0, 12) // mod time
    central.writeUInt16LE(0, 14) // mod date
    central.writeUInt32LE(rec.crc, 16)
    central.writeUInt32LE(rec.size, 20)
    central.writeUInt32LE(rec.size, 24)
    central.writeUInt16LE(rec.nameBuf.length, 28)
    central.writeUInt16LE(0, 30) // extra length
    central.writeUInt16LE(0, 32) // comment length
    central.writeUInt16LE(0, 34) // disk number start
    central.writeUInt16LE(0, 36) // internal attrs
    central.writeUInt32LE(0, 38) // external attrs
    central.writeUInt32LE(rec.offset, 42) // local header offset

    centralChunks.push(central, rec.nameBuf)
    centralSize += central.length + rec.nameBuf.length
  }

  const centralOffset = offset
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0) // end of central dir signature
  end.writeUInt16LE(0, 4) // disk number
  end.writeUInt16LE(0, 6) // disk with central dir
  end.writeUInt16LE(records.length, 8) // entries on this disk
  end.writeUInt16LE(records.length, 10) // total entries
  end.writeUInt32LE(centralSize, 12)
  end.writeUInt32LE(centralOffset, 16)
  end.writeUInt16LE(0, 20) // comment length

  return Buffer.concat([...localChunks, ...centralChunks, end])
}
