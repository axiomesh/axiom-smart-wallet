import { switchAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
    createMultiStyleConfigHelpers(switchAnatomy.keys)

const baseStyle = definePartsStyle({
    track: {
        _checked: {
            bg: 'yellow.400',
        },
    },
})

export const switchTheme = defineMultiStyleConfig({ baseStyle })
