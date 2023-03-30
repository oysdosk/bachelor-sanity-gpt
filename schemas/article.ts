import {defineField, defineType} from 'sanity';

export default defineType({
    name: 'article',
    title: 'Article',
    type: 'document',
    fields: [
      defineField({
        name: 'title',
        title: 'Title',
        type: 'string',
      }),
      defineField({
        name: 'image',
        title: 'Image',
        type: 'image',
        fields: [
            {
                name: 'caption',
                title: 'Caption',
                type: 'string',
            },
            {
                name: 'description',
                title: 'Description',
                type: 'string',
            }
        ]
      }),
      defineField({
        name: 'ingress',
        title: 'Ingress',
        type: 'text',
      }),
      defineField({
        name: 'body',
        title: 'Body',
        type: 'text',
      }),
      defineField({
        name: 'publishedAt',
        title: 'Published at',
        type: 'datetime',
      }),
    ]
  });