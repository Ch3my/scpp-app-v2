import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';

export const CompressAndResizeImage = async (imageUri: string, rotation: number): Promise<string> => {
    const resizeResult = await manipulateAsync(
        imageUri,
        [
            { resize: { width: 720 } },
            { rotate: rotation },
        ],
        { compress: 0.5, format: SaveFormat.JPEG }
    );

    if (resizeResult.uri) {
        return resizeResult.uri;
    } else {
        throw new Error('Error compressing and resizing image');
    }
};
