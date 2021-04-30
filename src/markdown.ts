export function casperMarkdown(m: { [key: string]: any }) {
    return function () {
        let entitylink = {
            type: 'lang',
            regex: /\B@([\w.]+)/g,
            replace: function (_: string, id: string) {
                let name = m[id]?.name || `[Reference Error: ${id}]`;
                return `<a href="/entity/${id}" class="deferred-router-link">${name}</a>`;
            },
        };

        return [entitylink];
    };
}
