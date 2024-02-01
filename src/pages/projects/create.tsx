import { api } from "~/utils/api"
const CreateProject = () => {
    return (
        <div className="h-lvh grid-flow-row place-content-center">
            <fieldset className="px-5 py-5">
                <label htmlFor="" className="px-5 py-5">
                    Project Name
                </label>
                <input className="border-black focus:border-orange-400" type="text" name="" id="projectName" />
            </fieldset>
            
            <fieldset className="px-5 py-5">
                <label htmlFor="" className="px-5 py-5">
                    Project Name
                </label>
                <input className="border-black focus:border-orange-400" type="text" name="" id="projectName" />
            </fieldset>
        </div>
    )
}
export default CreateProject
