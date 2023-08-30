import {Tabs} from "expo-router"

export default () => {
    return (
        <Tabs>
            <Tabs.Screen name="dashboard" options={{title: "Dashboard"}}/>
            <Tabs.Screen name="list-docs" options={{title: "Docs"}}/>
            <Tabs.Screen name="list-assets" options={{title: "Assets"}}/>
            <Tabs.Screen name="config" options={{title: "Config"}}/>
        </Tabs>
    )
}