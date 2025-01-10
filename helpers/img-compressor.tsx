import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';

export const CompressAndResizeImage = async (imageUri: string, rotation: number): Promise<string> => {
    const resizeResult = await manipulateAsync(
        imageUri,
        [
            { resize: { width: 1080 } },
            { rotate: rotation },
        ],
        { compress: 0.8, format: SaveFormat.JPEG }
    );

    if (resizeResult.uri) {
        return resizeResult.uri;
    } else {
        throw new Error('Error compressing and resizing image');
    }
};
