import { Box, Text, Flex, useColorModeValue, useColorMode, Tooltip } from "@chakra-ui/react";
export default function MainTag(props: any) {
    const { text, fullData, icon, ...rest } = props;
    const borderColor = useColorModeValue("rgba(0, 0, 0, 0.08)", "rgba(255, 255, 255, 0.08)");
    const bgColor = useColorModeValue("#FFFFF0", "rgba(236, 201, 75, 0.20)")
    const hoverBgColor = useColorModeValue("linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%), #FFFFF0", "linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%), rgba(236, 201, 75, 0.20)")
    const activeColor = useColorModeValue("linear-gradient(0deg, rgba(0, 0, 0, 0.15) 0%,rgba(0, 0, 0, 0.15) 100%), #FFFFF0", "linear-gradient(0deg, rgba(0, 0, 0, 0.15) 0%,rgba(0, 0, 0, 0.15) 100%), rgba(236, 201, 75, 0.20)");
    return (
        <Flex>
            <Flex
                align="center"
                border="1px solid rgba(0, 0, 0, 0.08)"
                borderRadius="8px"
                padding="5px 12px"
                h="36px"
                fontWeight="500"
                bg={bgColor}
                cursor={rest.onClick && (text || text === 0) ?  "pointer" : ""}
                borderColor={borderColor}
                _hover={{ bg: rest.onClick && (text || text === 0) ? hoverBgColor : "" }}
                _active={{ bg:  rest.onClick && (text || text === 0) ? activeColor : "" }}
                {...rest }
            >
                {icon ? <Box lineHeight="16px" mr="8px">{icon}</Box> : null}
                <Tooltip hasArrow label={fullData} fontSize="14px" borderRadius="4px" bg='gray.900' color='#FFFFFF' placement="top">
                    <Text _hover={{textDecoration: rest.onClick && (text || text === 0)  ? "underline" : "none" }} fontSize="14px"  color="#ECC94B">{(text || text === 0) ? text : '-'}</Text>
                </Tooltip>
            </Flex>
        </Flex>
    );
}
