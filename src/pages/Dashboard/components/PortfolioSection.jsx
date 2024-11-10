import { Button, HStack, Icon, Stack, Tag, Text } from '@chakra-ui/react'
import { MdInfo } from "react-icons/md";
import { MdFileDownload,MdFileUpload } from "react-icons/md";

const PortfolioSection = () => {
  return (
    <HStack justify="space-between" bg="white" borderRadius="xl" p="6"
      align={{
        base: "flex-start",
        xl: "center",
      }}

      flexDir={{
        base: "column",
        xl: "row",
      }}

      spacing={{
        base: 4,
        xl: 0,
      }}
    > 
      <HStack 
        spacing={{
          base: 0,
          xl: 16,
        }}
        align={{
          base: "flex-start",
          xl: "center",
        }}
  
        flexDir={{
          base: "column",
          xl: "row",
        }}
      >
        <Stack>
          <HStack color="black.80">
            <Text fontSize="sm">Total Portfolio Value</Text>
            <Icon as={MdInfo}/>
          </HStack>
          <Text textStyle="h2" fontWeight="medium">₹ 12,345.67</Text>
        </Stack>

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
              <Text textStyle="h2" fontWeight="medium">22.39401000</Text> <Tag colorScheme='grey'>BTC</Tag>
            </HStack>
            <HStack>
              <Text textStyle="h2" fontWeight="medium">₹ 1,345.67</Text> <Tag colorScheme='grey'>INR</Tag>
            </HStack>
          </HStack>
        </Stack>
      </HStack>

      <HStack>
        <Button leftIcon={<Icon as={MdFileDownload} pt="2px" fontSize="24px"/>}> Deposit</Button>
        <Button leftIcon={<Icon as={MdFileUpload} pt="2px" fontSize="24px"/>}>Withdraw</Button>
      </HStack>

    </HStack>
  )
}

export default PortfolioSection