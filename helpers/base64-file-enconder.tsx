import * as FileSystem from 'expo-file-system';
import mime from 'mime'; // Import the 'mime' package

interface FileContent {
  contentType: string;
  base64String: string;
}

export const ConvertToBase64 = (filePath: string): Promise<FileContent> => {
  return new Promise((resolve, reject) => {
    FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    })
      .then(base64String => {
        const contentType = GetContentType(filePath);
        resolve({
          contentType,
          base64String: `data:${contentType};base64,${base64String}`,
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};

const GetContentType = (filePath: string): string => {
  // Use the mime library to get the content type based on the file extension
  const extension = filePath.split('.').pop(); // Get the file extension
  const contentType = mime.getType(extension || ''); // Get MIME type using the extension
  return contentType || 'application/octet-stream'; // Default to 'application/octet-stream' if not found
};
