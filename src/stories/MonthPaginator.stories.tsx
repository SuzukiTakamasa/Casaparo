import React, { useState } from 'react'
import { StoryFn, Meta } from '@storybook/react'
import MonthPaginator, { MonthProvider, MonthStrProps } from '@components/MonthPaginator'

const meta: Meta<typeof MonthPaginator> = {
    title: 'Components/MonthPaginator',
    component: MonthPaginator,
    argTypes: {
        monthStr: { control: 'text' },
        cssStr: { control: 'text '}
    },
    decorators: [
        (Story) => (
            <div className="p-4 bg-gray-800">
                <Story/>
            </div>
        )
    ]
}

export default meta

type Story = StoryFn<typeof MonthPaginator>

const Template: Story = (args: MonthStrProps) => {
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())

    return (
        <MonthProvider month={month} setMonth={setMonth} setYear={setYear}>
            <MonthPaginator {...args} />
            <div className="mt-4 text-white">
                Current Year: {year}
            </div>
        </MonthProvider>
    )
}

export const Default: Story = Template.bind({})
Default.args = {
    monthStr: '月',
    cssStr: 'text-white text-xl font-bold',
}

export const CustomStyle = Template.bind({})
CustomStyle.args = {
    monthStr: 'Month',
    cssStr: 'text-yellow-300 text-2xl font-semibold',
}

export const InitialMonth = Template.bind({})
InitialMonth.args = {
    ...Default.args
}

InitialMonth.decorators = [
    (Story) => {
        const [month, setMonth] = useState(7)
        const [year, setYear] = useState(2024)
        return (
            <MonthProvider month={month} setMonth={setMonth} setYear={setYear}>
                <Story />
            </MonthProvider>
        )
    }
]