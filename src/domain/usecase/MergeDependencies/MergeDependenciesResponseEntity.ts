import { ChildProcess } from "child_process";
import { ProjectEntity } from "src/domain/entities/ProjectEntity";
import { ResponseEntity } from "src/domain/entities/ResponseEntity";

export interface MergeDependenciesResponse {

    /**
     * Projects that were ignored by the merge.
     */
    ignoredProjects: ProjectEntity[];

    /**
     * Projects that were merged.
     */
    mergedProjects: ProjectEntity[];

    /**
     * If dependencies were flagged to be installed, this is the
     * install process object that would be returned.
     */
    installProcess?: ChildProcess;
}

export type MergeDependenciesResponseEntity = ResponseEntity<MergeDependenciesResponse>;
