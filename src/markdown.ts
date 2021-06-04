export function casperMarkdown(m: { [key: string]: any }) {
    return function () {
        let entitylink = {
            type: 'lang',
            regex: /\B@([\w\.\-]+[\w\*])/g,
            replace: function (_: string, id: string) {
                let name = m[id]?.name || id;
                let path = id.replace('.', '/');
                return `<a href="/${path}" class="entity-link" data-entity-id="${id}">${name}</a>`;
            },
        };

        return [entitylink];
    };
}
