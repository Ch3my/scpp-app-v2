import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export async function CompressAndResizeImage(
  imageUri: string,
  rotation: number
): Promise<string> {
  try {
    // Create an ImageManipulator context from the URI
    const context = ImageManipulator.manipulate(imageUri)
      // Resize to a width (height is automatically scaled)
      .resize({ width: 1280 })
      // Rotate by the specified angle
      .rotate(rotation);

    // Render the transformations asynchronously and get a reference to the new image
    const imageRef = await context.renderAsync();

    // Finally, save the transformed image with compression and format
    const { uri } = await imageRef.saveAsync({
      compress: 0.8,
      format: SaveFormat.JPEG,
    });

    if (uri) {
      return uri;
    } else {
      throw new Error('Error compressing and resizing image');
    }
  } catch (error) {
    throw new Error(`Error compressing and resizing image: ${error}`);
  }
}
