import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ReactNativeFile from "apollo-upload-client/public/ReactNativeFile.js";
import { useMutation, gql } from '@apollo/client';

const mutationUpload = gql`
  mutation UploadImage( $image: [Upload!]!) {
    uploadImages(images: $image) {
      msg
    }
  }
`;

export default function PickImage() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [uploadImg, { data, loading, error }] = useMutation(mutationUpload, {
    onError: (err) => {
      console.log(err, "error graph");
    }
  });

  console.log(data, loading, JSON.stringify(error), "====");

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      let data = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      const result = data.assets[0];
      // ImagePicker saves the taken photo to disk and returns a local URI to it
      let localUri = result.uri;
      let filename = localUri.split('/').pop();

      // Infer the type of the image
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;

      const file = new ReactNativeFile({
        uri: localUri,
        name: filename,
        type,
      });

      console.log(file, "<---");

      // console.log(filename, localUri, match, type);
      // // Upload the image using the fetch and FormData APIs
      // let formData = new FormData();
      // console.log("DISINI <--");

      // // Assume "image" is the name of the form field the server expects
      // formData.append('image', { uri: localUri, name: filename, type });
      // formData.append("warna", "ijo");
      setImageFile(file);

      if (!result.cancelled) {
        setImage(result);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const uploadImage = async () => {
    try {
      await uploadImg({
        variables: {
          image: [imageFile]
        }
      });
    } catch (error) {
      console.log(error.errors, "<---------");
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={{ uri: image.uri }} style={{ width: 200, height: 200 }} />}

      <Button title="Upload to server" onPress={() => uploadImage()} />
    </View>
  );
}