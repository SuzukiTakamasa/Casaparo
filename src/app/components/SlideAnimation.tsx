import { useState } from 'react'

const SlideAnimation = () => {
    const [fellowIndex, setFellowIndex] = useState(0)
    const [isShowWords, setIsShowWords] = useState(false)

    const casaparoFellows = [
        {"⚪️": "< ﾏﾝﾏﾙﾏﾙ!!"},
        {"🦀": "< ｶﾆﾏﾛ!!"},
        {"🦵🦵": "< ｱﾝﾖｸﾜｶﾞﾀ!!"},
        {"🛀": "< ｵﾌﾛﾝ...ﾀﾛｽ"},
        {"🛌": "< ﾈﾝﾈﾏﾝ!!"},
        {"💥": "< ｳﾆﾏﾛ!!"},
        {"🧊": "< ﾁﾒﾃｰ!!"},
        {"🚨🚨": "< ﾋﾟｯﾋﾟｰ!!"}
    ]

    const selectedFellow = casaparoFellows[fellowIndex]

    return (
        <div className="w-full overflow-hidden">
            <div className="animate-slide flex whitespace-nowrap"
                 onAnimationIteration={() => {
                    setIsShowWords(false)
                    setFellowIndex(Math.floor(Math.random() * casaparoFellows.length))}}
            >
                <div
                     className="mx-4 text-white p-2 rounded-md"
                     onClick={() => setIsShowWords(!isShowWords)}
                >
                    {Object.keys(selectedFellow)}{isShowWords && Object.values(selectedFellow)}
                </div>
            </div>
        </div>
    )
}

export default SlideAnimation