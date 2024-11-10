import { Button, Card, Flex, HStack, Icon, Input, InputGroup, InputLeftElement, Tag } from "@chakra-ui/react"
import DashboardLayout from "../../components/DashboardLayout"
import { RiDownloadLine } from "react-icons/ri";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import TransactionTable from "./components/TransactionTable";
import { IoSearchOutline } from "react-icons/io5";

const TransactionPage = () => {

  const tabs = [
    {
      name: "All",
      count: 349,
    },
    {
      name: "Deposit",
      count: 144,
    },
    {
      name: "Withdraw",
      count: 55,
    },
    {
      name: "Trade",
      count: 50,
    },
  ]


  return (
    <DashboardLayout title="Transactions">
      <Flex justify="end" mt="6" mb="3">
        <Button leftIcon={<Icon as={RiDownloadLine}/>}>Export CSV</Button>
      </Flex>
      <Card borderRadius="1rem">
        <Tabs>
          <TabList pt="4" display="flex" w="full" justifyContent="space-between">
            <HStack>
              {
                tabs.map((tab) => (
                  <Tab key={tab.name} display="flex" gap="2" pb="4">
                    {tab.name} <Tag colorScheme="gray" borderRadius="full">{tab.count}</Tag>
                  </Tab>
                ))
              }
            </HStack>

            <InputGroup maxW="200px" pr="6">
              <InputLeftElement pointerEvents='none'>
                <Icon as={IoSearchOutline}/>
              </InputLeftElement>
              <Input type='tel' placeholder='Search...' />
            </InputGroup>
          </TabList>

          <TabPanels>
            <TabPanel>
              <TransactionTable/>
            </TabPanel>
            <TabPanel>
              <TransactionTable/>
            </TabPanel>
            <TabPanel>
              <TransactionTable/>
            </TabPanel>
            <TabPanel>
              <TransactionTable/>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </DashboardLayout>
  )
}

export default TransactionPage