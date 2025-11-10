type TitleProps = {
    title: string
}

export const PageTitle = ({title}: TitleProps) => {
    return <h1 className="text-2xl font-bold mc-4">{title}</h1>
}

export const CardTitle = ({title}: TitleProps) => {
    return <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
}