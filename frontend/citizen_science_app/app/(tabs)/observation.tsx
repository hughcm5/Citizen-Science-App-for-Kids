import {
  NativeBaseProvider,
  Box,
  Text,
  Button,
  Input,
  VStack,
  Image,
  Heading,
  Divider,
  ScrollView,
  Card,
} from "native-base";

import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function Observation() {
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
        {/* Main Heading */}
        <Heading size="md" mb={4} textAlign="center" mt={-10}>
          About Observations
        </Heading>

        {/* 
          Container but specifically arranges child components vertically
          space denotes the space between the vertical components
          px is the horizontal padding
        */}
        <Card bg="white" borderRadius="md" p={4} shadow={2} mb={4}>
          <VStack space={4} mb={6} alignItems="center" width="100%" px={4}>
            <Text fontSize="md">
              Observations are the <Text fontWeight="bold">data points</Text>{" "}
              collected by students in your citizen science projects. Each
              observation helps build a dataset for classroom analysis.
            </Text>

            <Text fontSize="md">
              A student can create/add an observations page, where the student can edit 
              or add data which include a variety of selections for the student to enter 
              in the app and submit. Once the data is submitted, their observations 
              page is uploaded with the submitted data, and that data is saved in the 
              server.
            </Text>
          </VStack>
        </Card>
        {/* my is the padding top/bottom space 4 is relatively small */}
        <Divider my={4} />

        {/* How It Works */}
        <Heading size="lg" mb={3}>
          How Observations Work
        </Heading>
        {/* Mapping an array of entries; exactly similar to how it works on React
            Dynamically mapping list of entries to save space and automate process
        */}
        <VStack space={3}>
          {[
            {
              icon: "edit-document",
              text: "Students record data using simple forms (checkboxes, dropdowns, numbers)",
            },
            {
              icon: "cloud-upload",
              text: "Observations automatically uploaded to the cloud database",
            },
            {
              icon: "dataset",
              text: "Teachers can view relevant statistics and utilize data visualizations",
            },
            {
              icon: "import-export",
              text: "Download and export full datasets as CSV files for further analysis",
            },
          ].map((item, index) => (
            <Box key={index} flexDirection="row" alignItems="flex-start">
              <MaterialIcons name={item.icon} size={20} color="#66BB6A" style={{ marginRight: 4 }}/>
              <Text flex={1}>{item.text}</Text>
            </Box>
          ))}
        </VStack>

        <Divider my={4} />

        {/* Connection to Projects */}
        <Heading size="lg" mb={3}>
          Observations + Projects
        </Heading>
        <Text>
          Each observation connects to a{" "}
          <Text fontWeight="bold">specific project</Text> in your classroom.
          Projects define:
        </Text>
        <VStack space={2} mt={2} pl={4}>
          <Text>• What data to collect </Text>
          <Text>• Which class codes can participate</Text>
          <Text>• How data appears in reports</Text>
        </VStack>
      </ScrollView>
    </NativeBaseProvider>
  );
}
