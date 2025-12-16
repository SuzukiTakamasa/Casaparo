import DOMPurify from 'dompurify'
import { convertUrlsToLinks } from '@utils/utility_function'

type SafeHTMLRendererProps = {
    className?: string;
    description: string;
}

const SafeHTMLRenderer = ({className, description}: SafeHTMLRendererProps) => {
    return <div className={`${className} description`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(convertUrlsToLinks(description), { 
            ADD_URI_SAFE_ATTR: ['target', 'rel'],
            ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ol', 'ul', 'li', 'span', 'div', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            ALLOWED_ATTR: ['style', 'href', 'target', 'rel', 'class']
        })}} />
}

export default SafeHTMLRenderer