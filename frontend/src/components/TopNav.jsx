import { Box, Button, Container, Flex, Heading, HStack, Icon, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { FaUserCircle, FaBars } from "react-icons/fa";

const TopNav = ({title, onOpen}) => {
  return (
    <Box px="4" bg="white">
        <HStack maxW="70rem" h="16" justify="space-between" mx="auto">
            <Icon as={FaBars} onClick={onOpen} 
                display={{
                    base: "block",
                    lg: "none",
                }}
            />
            <Heading fontWeight="medium" fontSize="28px">{title}</Heading>
            <Menu>
                <MenuButton as={Button} bg="white">
                    <Icon as={FaUserCircle} fontSize="24px" color="black"/>
                </MenuButton>
                <MenuList>
                    <MenuItem>Log out</MenuItem>
                    <MenuItem>Support</MenuItem>
                </MenuList>
            </Menu>
        </HStack>
    </Box>
  )
}

export default TopNav;