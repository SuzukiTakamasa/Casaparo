import { useState } from 'react'

const SlideAnimation = () => {
    const [fellowIndex, setFellowIndex] = useState(0)
    const [isShowWords, setIsShowWords] = useState(false)
    const [isRarePattern, setIsRarePattern] = useState(false)

    const casaparoFellows = [
        {"⚪️": isRarePattern ? "< ...ﾝ?" : "< ﾏﾝﾏﾙﾏﾙ!!"},
        {"🦀": isRarePattern ? "< ｲｴｰｲ!!" : "< ｶﾆﾏﾛ!!"},
        {"🦵🦵": isRarePattern ? "< ｶﾆｸﾜｶﾞﾀ!!" : "< ｱﾝﾖｸﾜｶﾞﾀ!!"},
        {"🛀": isRarePattern ? "< ...(ﾆｯｺﾘ)" : "< ｵﾌﾛﾝ...ﾀﾛｽ"},
        {"🛌": isRarePattern ? "< ｲｯﾊﾟｲﾈﾀｰ!!" : "< ﾈﾝﾈﾏﾝ!!"},
        {"💥": isRarePattern ? "< ｲ...ｲｴｰｲ!!" : "< ｳﾆﾏﾛ!!"},
        {"🧊": isRarePattern ? "< ﾁﾒﾃｰ!!" : "< ﾋﾝﾔﾘﾏﾛ!!"},
        {"🚨🚨": isRarePattern ? "< ﾌﾟｯﾌﾟｰ!!" : "< ﾋﾟｯﾋﾟｰ!!"},
        {"🌸": isRarePattern ? "< ﾁﾒﾃｰ!!" : "< ﾊﾙｷﾀｰ!"},
        {"🐽": isRarePattern ? "< ﾌﾞｯﾌﾞｯ" : "< ﾌﾞ-!!"},
        {"⚔️": isRarePattern ? "< ﾋｴﾃｵﾛ~" : "< ｱﾀﾀﾏﾛ〜"},
        {"⛄️": isRarePattern ? "< ﾏﾀ...ﾗｲ...ﾈﾝ" : "ｽﾉﾏﾛ!!"}
    ]

    const selectedFellow = casaparoFellows[fellowIndex]

    return (
        <div className="w-full overflow-hidden">
            <div className="animate-slide flex whitespace-nowrap"
                 onAnimationIteration={() => {
                    setIsShowWords(false)
                    setFellowIndex(Math.floor(Math.random() * casaparoFellows.length))
                    setIsRarePattern(Math.random() < 0.1)
                }}
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