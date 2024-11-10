import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Stack,
    Text,
    Tag,
  } from '@chakra-ui/react'

const TransactionTable = () => {

    const tableData = [
        {
            id: "HD82NA2H",
            date: "2024-09-17",
            time: "01:12 AM",
            type: {
                name: "INR Deposit",
                tag: "E-Transfer",
            },
            amount: "+₹81,123",
            status: "pending",
        },

        {
            id: "HD82NA4H",
            date: "2024-09-15",
            time: "01:00 AM",
            type: {
                name: "INR Withdraw",
                tag: "Wire Transfer",
            },
            amount: "-₹81,123",
            status: "processing",
        },

        {
            id: "HD82NA5H",
            date: "2024-09-13",
            time: "04:34 PM",
            type: {
                name: "Buy",
                tag: "BTC"
            },
            amount: "12.0554484 BTC",
            status: "cancelled",
        },

        {
            id: "HD82NA6H",
            date: "2024-09-12",
            time: "11:23 AM",
            type: {
                name: "INR Deposit",
                tag: "E-Transfer",
            },
            amount: "+₹81,123",
            status: "pending",
        },

        {
            id: "HD82NA7H",
            date: "2024-09-11",
            time: "01:12 AM",
            type: {
                name: "BTC Deposit",
            },
            amount: "+15.5000000 BTC",
            status: "pending",
        },

        {
            id: "HD82NA8H",
            date: "2024-09-10",
            time: "01:12 AM",
            type: {
                name: "BTC withdraw",
            },
            amount: "-5.05555544 BTC",
            status: "completed",
        },
    ]

    const statusColor = {
        pending: "#797E82",
        processing: "#F5A50B",
        cancelled: "#059669",
        completed: "#DC2626",
    }


  return (
    <TableContainer>
        <Table variant='simple' colorScheme="gray">
            <Thead>
            <Tr>
                <Th>ID</Th>
                <Th>Date & time</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
            </Tr>
            </Thead>
            <Tbody color="p.black">
                {
                    tableData.map((data) => (
                    <Tr key={data.id}>
                        <Td fontSize="sm" fontWeight="medium">{data.id}</Td>
                        <Td>
                            <Stack spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">{data.date}</Text>
                                <Text fontSize="xs" color="black.60">{data.time}</Text>
                            </Stack>
                        </Td>
                        <Td>
                            {" "}                           
                            <Stack spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">{data.type.name}</Text>
                                <Text fontSize="xs" color="black.60">{data.type.tag}</Text>
                            </Stack>
                        </Td>
                        <Td fontSize="sm" fontWeight="medium">{data.amount}</Td>
                        <Td borderRadius="full" fontSize="sm" fontWeight="medium">
                            <Tag bg={statusColor[data.status]} color="white" borderRadius="full">{data.status}</Tag>
                        </Td>           
                    </Tr>))
                }
            </Tbody>
        </Table>
    </TableContainer>
  )
}

export default TransactionTable