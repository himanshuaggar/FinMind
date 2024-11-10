import { Box, HStack, Stack, Icon, Text, Heading } from "@chakra-ui/react"
import { RxDashboard } from "react-icons/rx";
import { TbArrowsDoubleNeSw, TbMessageChatbotFilled, TbReportAnalytics } from "react-icons/tb";
import { BiSupport } from "react-icons/bi";
import { GiTeacher } from "react-icons/gi";
import { Link, useLocation } from "react-router-dom";

const SideNav = () => {
    const location = useLocation();

    const isActiveLink = (link) =>{
        return location.pathname===link;
    }

    const navLinks = [
        {
        icon: RxDashboard,
        text: "Dashboard",
        link: "/",
        },
        // {
        // icon: TbArrowsDoubleNeSw,
        // text: "Transactions",
        // link: "/transactions",
        // },
        {
        icon: GiTeacher,
        text: "Advisor",
        link: "/advisor",
        },
        {
        icon: TbReportAnalytics,
        text: "Analyser",
        link: "/analyser",
        },
    ]

  return (
    <Stack justify="space-between" bg="white" boxShadow={{
        base:"none",
        lg: "lg",
    }} 
    w={{
        base:"full",
        lg:"16rem",
    }}
    height="100vh">
        <Box >
            <Heading textAlign="center" fontSize="20px" as="h1" pt="3.5rem">
                FinalytiQ
            </Heading>
            <Box mt="6" mx="3">
                {
                navLinks.map((nav) => (
                    <Link to={nav.link} key={nav.text}>
                    <HStack 
                        bg={isActiveLink(nav.link)? "#F3F3F7":"transparent"}
                        color={isActiveLink(nav.link)? "#171717":"#797E82"}
                        borderRadius="10px" 
                        mx="12px"  
                        py="3" px="4"

                        // bg={isActiveLink("/support")? "#F3F3F7":"transparent"}
                        // color={isActiveLink("/support")? "#171717":"#797E82"}

                        _hover={{bg: "#F3F3F7", color: "#171717"}} 
                        >
                        <Icon as={nav.icon}/>
                        <Text fontSize="14px" fontWeight="medium">{nav.text}</Text>
                    </HStack>
                    </Link>
                ))
                }
            </Box>
        </Box>


        <Box mt="6" mx="3" mb="6">
        <Link to="/bot">
            <HStack 
                borderRadius="10px" 
                py="3" px="4" 
                _hover={{bg: "#F3F3F7", color: "#171717"}} 
                color="#797E82"
                >                
                <Icon as={TbMessageChatbotFilled}/>
                <Text fontSize="14px" fontWeight="medium">Chat</Text>
            </HStack>
        </Link>
        <Link to="/support">
            <HStack 
                borderRadius="10px" 
                py="3" px="4" 
                _hover={{bg: "#F3F3F7", color: "#171717"}} 
                color="#797E82"
                >                
                <Icon as={BiSupport}/>
                <Text fontSize="14px" fontWeight="medium">Support</Text>
            </HStack>
        </Link>
            
        </Box>
    </Stack>
  )
}

export default SideNav