export function casperMarkdown(m: { [key: string]: any }) {
    return function () {
        let entitylink = {
            type: 'lang',
            regex: /\B@([\w.]+)/g,
            replace: function (_: string, id: string) {
                let name = m[id]?.name || `[Reference Error: ${id}]`;
                let path = id.replace('.', '/');
                return `<a href="/${path}" class="markdown-entity-link" data-entity-id="${id}">${name}</a>`;
            },
        };

        return [entitylink];
    };
}
