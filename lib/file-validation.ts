import { fileTypeFromBuffer } from "file-type";

/**
 * Allowed MIME types for file uploads
 */
const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",

  // Documents
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx

  // Apple iWork
  "application/x-iwork-keynote-sffkey", // .key
  "application/x-iwork-pages-sffpages", // .pages
  "application/x-iwork-numbers-sffnumbers", // .numbers

  // Archives
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",

  // Design files
  "application/postscript", // .ai
  "image/vnd.adobe.photoshop", // .psd
  "application/octet-stream", // .xd (Adobe XD doesn't have official MIME type)
];

/**
 * Dangerous file extensions that should never be allowed
 */
const DANGEROUS_EXTENSIONS = [
  ".exe",
  ".dll",
  ".bat",
  ".cmd",
  ".sh",
  ".bash",
  ".ps1",
  ".app",
  ".deb",
  ".rpm",
  ".msi",
  ".com",
  ".scr",
  ".vbs",
  ".js", // Executable JavaScript
  ".jar",
  ".apk",
  ".dmg",
  ".pkg",
];

/**
 * Validate file by checking actual MIME type (magic bytes)
 * This is more secure than just checking the extension
 */
export async function validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // Check file size
  const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10) * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds maximum size of ${process.env.MAX_FILE_SIZE_MB || 10}MB`,
    };
  }

  // Check for dangerous extensions
  const fileName = file.name.toLowerCase();
  const isDangerous = DANGEROUS_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  if (isDangerous) {
    return {
      valid: false,
      error: `File type not allowed: "${file.name}"`,
    };
  }

  // Read first 4KB of file to check magic bytes
  try {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer.slice(0, 4100));

    // Detect actual file type from magic bytes
    const fileType = await fileTypeFromBuffer(uint8Array);

    // If we can't detect the file type, check if it's a text file or other allowed types
    if (!fileType) {
      // Allow text files and CSVs (no magic bytes)
      if (fileName.endsWith(".txt") || fileName.endsWith(".csv") || fileName.endsWith(".md")) {
        return { valid: true };
      }

      // For Apple iWork files and other special cases, rely on extension
      const appleExtensions = [".key", ".pages", ".numbers"];
      if (appleExtensions.some((ext) => fileName.endsWith(ext))) {
        // iWork files are actually ZIP archives, so check for ZIP signature
        const isZip = uint8Array[0] === 0x50 && uint8Array[1] === 0x4b;
        if (isZip) {
          return { valid: true };
        }
      }

      return {
        valid: false,
        error: `Unable to verify file type for "${file.name}"`,
      };
    }

    // Check if detected MIME type is in allowed list
    const isAllowed = ALLOWED_MIME_TYPES.includes(fileType.mime);
    if (!isAllowed) {
      return {
        valid: false,
        error: `File type "${fileType.mime}" is not allowed`,
      };
    }

    // Additional check: verify extension matches detected type
    const expectedExt = fileType.ext;
    const actualExt = fileName.split(".").pop();

    // Some files have multiple valid extensions, so we'll be lenient here
    // But we should at least check that it's not a disguised executable
    if (actualExt && DANGEROUS_EXTENSIONS.includes(`.${actualExt}`)) {
      return {
        valid: false,
        error: `Dangerous file extension detected: "${file.name}"`,
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("File validation error:", error);
    return {
      valid: false,
      error: `Error validating file "${file.name}"`,
    };
  }
}

/**
 * Validate multiple files
 */
export async function validateFiles(files: File[]): Promise<{ valid: boolean; errors: string[] }> {
  const maxFiles = parseInt(process.env.MAX_FILES || "3", 10);

  if (files.length > maxFiles) {
    return {
      valid: false,
      errors: [`You can only upload up to ${maxFiles} files at once`],
    };
  }

  const errors: string[] = [];

  for (const file of files) {
    const result = await validateFile(file);
    if (!result.valid && result.error) {
      errors.push(result.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
