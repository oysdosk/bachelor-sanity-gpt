import {createClient} from '@sanity/client'
import {basename} from 'path'
import {createReadStream} from 'fs'


export const uploadAsset = async() => {
    
    const client = createClient({
      projectId: '9mm9d4oe',
      dataset: 'production',
      apiVersion: '2022-09-01',
      token: 'skE7AFdutfCX66Y1uke4ZvXvFknkobpVuT0fubjYmGSXhho8yGRjkeQC3e7rXlzQ8gk8Yw4Q0W65oTXwCWDsDaf4Whqmgh84ta69O42ZpkyhSBWdxqdJzD218XE0kjKHHywMgiKH3uZvOYJtqfYfqRnHf743SKuI36RmTYGdnEmezdoyVlZw'
    })
    
    const filePath = './images/forest.jpg'

    client.assets
    .upload('image', createReadStream(filePath), {
        filename: basename(filePath)
    })
    .then(imageAsset => {
        // Here you can decide what to do with the returned asset document. 
        // If you want to set a specific asset field you can to the following:
        return client
        .patch('drafts.bOAZZ17pVhEULXs1humQIj')
        .set({
            theImageField: {
            _type: 'image',
            asset: {
                _type: "reference",
                _ref: imageAsset._id
            }
            }
        })
        .commit()
    })
    .then(() => {
        console.log("Done!");
    })
}
