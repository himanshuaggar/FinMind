import { Button, Flex, HStack, Icon, Image, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import { CustomCard } from "../../../chakra/CustomCard"
import { FaArrowTrendUp, FaCircleMinus, FaCirclePlus } from "react-icons/fa6";

const PriceSection = () => {

    const timeStamps = ["7:15PM", "7:55PM", "8:55PM", "9:55PM", "10:55PM"];

  return (
    <CustomCard>
        <Flex justify="space-between" align="start">
            <Stack>
            <HStack color="black.80">
                <Text fontSize="sm">Wallet Balances</Text>
            </HStack>
            <HStack spacing={4}
                align={{
                base: "flex-start",
                sm: "center",
                }}
        
                flexDir={{
                base: "column",
                sm: "row",
                }}
            >
                <HStack>
                <Text textStyle="h2" fontWeight="medium">22.39401000</Text>{" "}
                <HStack fontWeight="medium" color="green.500">
                    <Icon as={FaArrowTrendUp}/>
                    <Text fontStyle="sm" fontWeight="medium">22%</Text>
                </HStack>
                </HStack>
                </HStack>
            </Stack>

            <HStack>
                <Button leftIcon={<Icon as={FaCirclePlus} pt="2px" fontSize="24px"/>}> Buy</Button>
                <Button leftIcon={<Icon as={FaCircleMinus} pt="2px" fontSize="24px"/>}>Sell</Button>
            </HStack>
        </Flex>
        <Tabs variant='soft-rounded'>
            <Flex justify="end">
                <TabList bg="black.5" p="3px">
                    {
                        ["1H","1D","1W","1M"].map((tab) =>(
                            <Tab _selected={{bg:"white"}} key={tab} fontSize="sm" p="6px" borderRadius="4">
                                {tab}
                            </Tab>
                        ))
                    }
                    
                </TabList>
            </Flex>
            <TabPanels>
                <TabPanel>
                <Image w="100%" src="Graph.png" pt="3rem"/>
                    <HStack justify="space-between">
                        {
                        timeStamps.map((timeStamp)=>(
                            <Text key={timeStamp} fontSize="sm" color="black.80">
                                {timeStamp}
                            </Text>
                        ))
                        }
                    </HStack>
                </TabPanel>
                <TabPanel>
                <p>two!</p>
                </TabPanel>
            </TabPanels>
        </Tabs>

    </CustomCard>
  )
}

export default PriceSection