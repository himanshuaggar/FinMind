import { IoIosMail } from "react-icons/io"
import DashboardLayout from "../../components/DashboardLayout"
import ContactCard from "./components/ContactCard"
import SupportCard from "./components/SupportCard"
import { BiSolidMessageRounded } from "react-icons/bi";
import InfoCard from "../Dashboard/components/InfoCard";
import { Stack } from "@chakra-ui/react";

const Support = () => {
  return (
    <DashboardLayout>
      <Stack spacing="80px">
        <SupportCard
          leftComponent={<ContactCard/>}
          icon={IoIosMail}
          title="Contact Us"
          text="Have a question or just want to know more? Feel free to reach out to us."
        />
        <SupportCard
          leftComponent={<InfoCard
                          imgUrl="/Contacts_img.svg"
                          text="Learn more about our real estate, mortgage, and corporate account services"
                          tagText="Contacts"
                          inverted={false}
                        />}
          icon={BiSolidMessageRounded}
          title="Live chat"
          text="Don't have time to wait for the answer? Chat with us."
        />
      </Stack>
    </DashboardLayout>
  )
}

export default Support