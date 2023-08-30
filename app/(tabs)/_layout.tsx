import {Tabs} from "expo-router"

export default () => {
    return (
        <Tabs>
            <Tabs.Screen name="dashboard"/>
            <Tabs.Screen name="list-assets"/>
        </Tabs>
    )
}