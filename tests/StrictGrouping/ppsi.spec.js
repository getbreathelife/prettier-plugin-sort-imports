run_spec(__dirname, ["typescript"], {
    importOrder: ['^@core/(.*)$', '^@server/(.*)', '^@ui/(.*)$', '^[./]'],
    importOrderSeparation: true,
    strictGrouping: true,
});
