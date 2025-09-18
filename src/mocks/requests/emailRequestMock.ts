export const outboundEmailRequestMock = {
    from: '[user@usehatchapp.com](mailto:user@usehatchapp.com)',
    to: '[contact@gmail.com](mailto:contact@gmail.com)',
    body: 'text message with or without html',
    attachments: [],
    timestamp: '2024-11-01T14:00:00Z',
};

export const inboundEmailRequestMock = {
    from: '[user@usehatchapp.com](mailto:user@usehatchapp.com)',
    to: '[contact@gmail.com](mailto:contact@gmail.com)',
    xillio_id: 'message-2',
    body: '<html><body>html is <b>allowed</b> here </body></html>',
    attachments: ['https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf'],
    timestamp: '2024-11-01T14:00:00Z',
};
