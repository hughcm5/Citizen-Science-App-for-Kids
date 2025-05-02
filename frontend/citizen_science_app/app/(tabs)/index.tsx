import React, {useState} from "react";
import {
  NativeBaseProvider,
  Box,
  Text,
  Button,
  Input,
  VStack,
  Image,
  Spinner
} from "native-base";

export default function HomeScreen() {
  // Sets class code to track input
  const [classCode, setClassCode] = useState("");

  // Set loading state
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    console.log("Example mock send data to backend", classCode)
    alert(`Class code "${classCode}" submitted!`);
  }

  return (
    // Outer wrapper required that enables automatic styling like react bootstrap
    // to its child components inside the app, NEED this to style properly
    <NativeBaseProvider>
      {/*
        Box component is container for image component mb=marginBottom
        resizeMode = contain ensures image scales to fit inside the container
        while maintaing aspect ratio (doesnt distort image)
      */}
      <Box>
        <Box mb={6} width="100%">
          <Image
            source={{
              uri: "https://ssec.si.edu/sites/default/files/MOBILE%20APPS%20FOR%20CITIZEN%20SCIENCE%205_0.png",
            }} 
            style={{ width: "100%", height: 300 }}
            resizeMode="contain"
          />
        </Box>
      </Box>

      {/* 
          App title with text component, text displays titles
          fontSize
          xs: Extra Small
          sm: Small
          md: Medium
          lg: Large
          xl: Extra Large
          2xl: 2x Extra Large
          3xl: 3x Extra Large
          4xl: 4x Extra Large
          5xl: 5x Extra Large
          6xl: 6x Extra Large
          7xl: 7x Extra Large
          8xl: 8x Extra Large
      */}
      <Text fontSize="3xl" fontWeight="bold" mb={20} mt={-10}>
        Welcome to the Citizen Science Mobile App!
      </Text>

      {/* Instructions */}
      <Text fontSize="lg" mb={3}>
        Please enter your class code to get started:
      </Text>

      {/* 
        Container but specifically arranges child components vertically
        space denotes the space between the vertical components
        p means padding
        bg = means background color
      */}
      <VStack space={4} alignItems="center" p={4}>
        <Input
          placeholder="Enter class code"
          size="lg"
          variant="filled"
          bg="white"
          value={classCode}
          onChangeText={setClassCode}
          accessibilityLabel="Enter class code input"
        />

        {/* 
        Enter button 
        Submitting adds the following classcode into the backend database
        */}
        <Button
          size="lg"
          colorScheme="teal"
          onPress={handleSubmit}
        >
          Enter
        </Button>
      </VStack>
    </NativeBaseProvider>
  );
}
