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
  Spinner,
  ScrollView,
  Card,
} from "native-base";

import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function Project() {
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
          Understanding Projects in Our System
        </Heading>

        {/* 
        Container but specifically arranges child components vertically
        space denotes the space between the vertical components
        px is the horizontal padding
      */}
        <Card bg="white" borderRadius="md" p={4} shadow={2} mb={4}>
          <VStack space={4} mb={6} alignItems="center" width="100%" px={4}>
            <Box
              accessible={true}
              accessibilityLabel="Each project belongs to a specific classroom"
            >
              <Text fontSize="md">
                A Citizen Science App project is a structured project where
                teachers can create a project associated with a class code. Each
                project is listed to the students with the respective class code
                where they can collaborate to collect and analyze observations.
                Projects are tied to specific classrooms and customized to
                include different settings.
              </Text>
            </Box>

            <Text fontSize="md">
              In our admin website system, projects server as containers for
              multiple observations, allowing an organized data collection and
              analysis for students.
            </Text>
          </VStack>
        </Card>
        {/* my is the padding top/bottom space 4 is relatively small */}
        <Divider my={4} />

        {/* How Projects Work */}
        <Heading size="lg" mb={3}>
          How Projects Work
        </Heading>
        <VStack space={3} mb={6}>
          <Box flexDirection="row" alignItems="flex-start">
            <MaterialIcons
              name="class"
              size={20}
              color="#3B82F6"
              style={{ marginRight: 4 }}
            />
            <Text>Each project belongs to a specific classroom </Text>
          </Box>

          <Box flexDirection="row" alignItems="flex-start">
            <MaterialIcons
              name="folder"
              size={20}
              color="#3B82F6"
              style={{ marginRight: 4 }}
            />
            <Text>
              Teachers can create multiple projects for different learning
              objectives
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="flex-start">
            <MaterialIcons
              name="assignment"
              size={20}
              color="#3B82F6"
              style={{ marginRight: 4 }}
            />
            <Text>
              Projects contain the id, class code, title, descriptions, creation
              date, and customizable settings that apply to all observations
              within them
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="flex-start">
            <FontAwesome5
              name="file-csv"
              size={20}
              color="#3B82F6"
              style={{ marginRight: 4 }}
            />
            <Text>
              Data from projects can be exported via the CSV Service for further
              analysis
            </Text>
          </Box>
        </VStack>

        <Divider my={4} />
      </ScrollView>
    </NativeBaseProvider>
  );
}
