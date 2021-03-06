import {
  Heading,
  VStack,
  Divider,
  Center,
  Text,
  Image,
  FormControl,
  FormLabel,
  Spinner,
  Box,
  HStack,
  Link,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect } from "react";
import { Card } from "../layout/card";
import { SideBySide } from "../layout/sideBySide";
import { LocalitySearch } from "../localitySearch";
import { useUserContext } from "../userContext";
import { CandidateResult } from "../../pages/api/candidates";

export const FindOptions: React.FC = () => {
  return (
    <SideBySide
      boxProps={{
        bgColor: "gray.200",
      }}
      left={
        <>
          <Heading>1. Find your options</Heading>
          <Text>Find out which parties have candidates in your electorate</Text>
          <HStack>
            <Image
              alt="AEC logo"
              w="30px"
              borderRadius={"100%"}
              src="https://www.aec.gov.au/_template/css/img/face-share-logo.jpg"
            />
            <Text fontSize={"small"}>
              Electorates provided by the{" "}
              <Link href="https://electorate.aec.gov.au/" target={"_blank"}>
                Australian Electoral Commission
              </Link>
            </Text>
          </HStack>
          <HStack>
            <Image
              alt="tallyroom logo"
              w="30px"
              borderRadius={"100%"}
              src="https://i.scdn.co/image/0650f27e7af6085be602b9672d5009f8c8bfc0e0"
            />
            <Text fontSize={"small"}>
              Candidates provided by{" "}
              <Link href="https://www.tallyroom.com.au" target="_blank">
                The Tally Room
              </Link>
            </Text>
          </HStack>
        </>
      }
      right={
        <Card>
          <VStack align="stretch" spacing={4}>
            <PartySearch />
          </VStack>
        </Card>
      }
    ></SideBySide>
  );
};

const PartySearch = () => {
  const { setElectorate, electorate } = useUserContext();

  return (
    <VStack spacing={6} align="stretch">
      <FormControl>
        <FormLabel>Find your electorate</FormLabel>
        <LocalitySearch
          name="locality-search"
          placeholder="Enter your suburb or locality"
          onChange={(value) => {
            setElectorate(value.electorate);
          }}
        />
      </FormControl>

      {electorate && (
        <Text fontSize={"large"} fontWeight={"semibold"}>
          Your electorate is {electorate.toUpperCase()}
        </Text>
      )}

      <Divider />
      <CandidatesList electorate={electorate} />
    </VStack>
  );
};

const CandidatesList: React.FC<{ electorate: string }> = ({ electorate }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { candidates, setCandidates } = useUserContext();

  useEffect(() => {
    if (!electorate) {
      return;
    }
    setIsLoading(true);
    try {
      getCandidatesForElectorate(electorate).then((result) => {
        setCandidates(result);
      });
    } catch (e) {
      console.warn(e);
    }
    setIsLoading(false);
  }, [electorate, setCandidates]);

  if (!electorate) {
    return (
      <Center
        border="1px dashed"
        borderColor={"gray.300"}
        borderRadius={4}
        minH={200}
      >
        <Text color="gray.400">Select an electorate above</Text>
      </Center>
    );
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <VStack align="flex-start">
      <Text fontWeight={"semibold"} as="u">
        Candidates:
      </Text>
      {candidates.map((candidate) => (
        <Box key={candidate.name}>
          <Text as="span">{candidate.party}</Text>{" "}
          <Text color="gray.500" fontSize={"small"} as="span">
            ({candidate.name})
          </Text>
        </Box>
      ))}
    </VStack>
  );
};

async function getCandidatesForElectorate(electorate: string) {
  const res = await axios.get<CandidateResult[]>(
    `api/candidates?electorate=${electorate}`
  );
  return res.data;
}
