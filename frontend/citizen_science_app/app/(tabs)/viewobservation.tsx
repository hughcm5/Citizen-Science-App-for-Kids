import {
  NativeBaseProvider,
  Box,
  Text,
  VStack,
  Image,
  Heading,
  ScrollView,
  Card,
  IconButton,
  Icon,
  Button,
} from "native-base";

import React, { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function viewobservation() {
  // Observation usestate to store list of observations in an array
  // from backend endpoint requests
  const [observations, setObservations] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // Use effect that triggers only once at the start of component render to fetch
  // all observations stored in the backend
  useEffect(() => {
    fetch("http://192.168.68.104:5002/observations")
      .then((response) => response.json())
      .then((data) => {
        setObservations(data);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  }, [refresh]);

  // Function to handle delete requests forf specific observation data
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://192.168.68.104:5002/observations/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setObservations((prevArray) =>
          prevArray.filter((observ) => observ.observation_id !== id)
        );
      }
    } catch (error) {
      console.error("Error deleting observation:", error);
    }
  };

  return (
    <NativeBaseProvider>
      {/* 
          ScrollView allows scrolling of the entire component
        */}
      <ScrollView>
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

        <Button onPress={() => setRefresh((prev) => !prev)}>
          Click here to refresh added observations
        </Button>

        {/* 
          Dynamic mapping of all observations from the backend to create card components
          for every obsveration
        */}
        {observations.map((observation) => {
          const { observationText, checkboxOptions, observationDropdown } =
            observation["observation data"];

          let displayText = "No observation available";

          if (observationText) {
            displayText = observationText;
          } else if (checkboxOptions && checkboxOptions.length > 0) {
            displayText = checkboxOptions.join(", ");
          } else if (observationDropdown) {
            displayText = Array.isArray(observationDropdown)
              ? observationDropdown.join(", ")
              : observationDropdown;
          }

          return (
            <Card key={observation.observation_id} m={4}>
              <Box p={5}>
                {/* 
                Icon button that renders a red 'x' at the top right of every observation
                card component, handles deletion of obsveration records based on id clicked

                Absolute position means the x is positioned on the very top of the component
                top,right = 1 means its 1 unit from the top and right
              */}
                <IconButton
                  icon={<Icon as={MaterialIcons} name="close" />}
                  position="absolute"
                  top={1}
                  right={1}
                  size="sm"
                  _icon={{ color: "red.600" }}
                  onPress={() => handleDelete(observation.observation_id)}
                />
                {/* 
                Part of the card card component that displays info
                color="color.500" refers to the color and shade intensity
                100 means light and .900 means darkest
                fontSize is the size of text
              */}
                <VStack space={2}>
                  <Heading size="md">
                    Observation ID: {observation.observation_id} for Project:{" "}
                    {observation.project_id}
                  </Heading>
                  <Text>
                    Observations: {displayText}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Created: {new Date(observation.created_at).toLocaleString()}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Last Updated:{" "}
                    {new Date(observation.updated_at).toLocaleString()}
                  </Text>
                </VStack>
              </Box>
            </Card>
          );
        })}
      </ScrollView>
    </NativeBaseProvider>
  );
}
