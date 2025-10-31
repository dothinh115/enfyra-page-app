export default defineNuxtPlugin(async () => {
  const { logout } = useEnfyraAuth();

  const {
    registerAllMenusFromApi,
    registerTableMenusWithSidebarIds,
    registerMenuItem,
  } = useMenuRegistry();
  const { schemas, fetchSchema } = useSchema();
  const { fetchSetting } = useGlobalState();
  const { confirm } = useConfirm();
  const { loadRoutes } = useRoutes();

  const { fetchMenuDefinitions } = useMenuApi();

  const [, , , menuResponse] = await Promise.all([
    fetchSchema(),
    fetchSetting(),
    loadRoutes(),
    fetchMenuDefinitions(),
  ]);

  const menuData = (menuResponse && "data" in menuResponse && Array.isArray(menuResponse.data))
    ? menuResponse.data
    : [];

  if (menuData.length > 0) {
    await registerAllMenusFromApi(menuData);
  }

  // Only register Collections if not already in API data
  const hasCollections = menuData.some(
    (item: any) => item.label === "Collections" || item.path === "/collections"
  );
  if (!hasCollections) {
    registerMenuItem({
      id: "collections",
      label: "Collections",
      icon: "lucide:table",
      route: "/collections",
      type: "Dropdown Menu",
      order: 1,
      position: "top" as any,
      permission: {
        and: [
          { route: `/table_definition`, actions: ["read"] }
        ]
      }
    } as any);
  }

  // Only register Data if not already in API data
  const hasData = menuData.some(
    (item: any) => item.label === "Data" || item.path === "/data"
  );
  if (!hasData) {
    registerMenuItem({
      id: "data",
      label: "Data",
      icon: "lucide:database",
      route: "/data",
      type: "Dropdown Menu",
      order: 2,
      position: "top" as any,
    } as any);
  }

  const schemaValues = Object.values(schemas.value);
  if (schemaValues.length > 0) {
    await registerTableMenusWithSidebarIds(schemaValues);
  }

  // Register logout as a special menu item
  registerMenuItem({
    id: "logout",
    label: "Logout",
    icon: "lucide:log-out",
    route: "",
    type: "Menu",
    order: 9999, // Put at the end
    position: "bottom" as any,
    class: "rotate-180",
    onClick: async () => {
      const ok = await confirm({ content: "Are you sure you want to logout?" });
      if (ok) await logout();
    },
  } as any);
});
