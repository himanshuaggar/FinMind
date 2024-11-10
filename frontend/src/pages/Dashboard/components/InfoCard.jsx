import { Tag, Text } from '@chakra-ui/react'
import React from 'react'
import { CustomCard } from '../../../chakra/CustomCard'

const InfoCard = ({imgUrl, text, tagText, inverted}) => {
  return ( 
    <CustomCard bgImage={imgUrl} bgSize="cover" bgRepeat="no-repeat" bgColor ={inverted? "white":"p.purple"}>
        <Tag bg={inverted? "p.purple":"white"} color={inverted? "white":"p.purple"} borderRadius="full">{tagText}</Tag>

        <Text mt="4" fontWeight="medium" textStyle="h5">{text}</Text>
    </CustomCard>
  )
}

export default InfoCard