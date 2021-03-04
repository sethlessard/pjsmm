import { ProjectEntity } from "../domain/entities/ProjectEntity";
import { ResponseEntity } from "../domain/entities/ResponseEntity";

interface MergeDependenciesResponse {

    /**
     * Projects that were ignored by the merge.
     */
    ignoredProjects: ProjectEntity[];

    /**
     * Projects that were merged.
     */
    mergedProjects: ProjectEntity[];
}

export type MergeDependenciesResponseEntity = ResponseEntity<MergeDependenciesResponse>;
