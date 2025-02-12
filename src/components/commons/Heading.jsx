import React from 'react'

const Heading = ({title, icons}) => {
    return (
        <h2 className="text-xl font-semibold mb-4 text-gray-600 flex items-center gap-1">
            {icons} {title}
        </h2>
    )
}

export default Heading