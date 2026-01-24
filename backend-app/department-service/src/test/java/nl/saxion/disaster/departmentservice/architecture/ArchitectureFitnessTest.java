package nl.saxion.disaster.departmentservice.architecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.library.Architectures.layeredArchitecture;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

/**
 * Architecture fitness functions enforcing bounded context integrity
 * and layered architecture for the Department Service.
 */
@AnalyzeClasses(
    packages = "nl.saxion.disaster.departmentservice",
    importOptions = ImportOption.DoNotIncludeTests.class
)
public class ArchitectureFitnessTest {

    /**
     * Enforces layered architecture: Controllers → Services → Repositories.
     */
    @ArchTest
    static final ArchRule layer_dependencies_are_respected = layeredArchitecture()
        .consideringAllDependencies()
        .layer("Controller").definedBy("..controller..")
        .layer("Service").definedBy("..service..")
        .layer("Repository").definedBy("..repository..")
        .layer("Model").definedBy("..model..")
        .layer("DTO").definedBy("..dto..")
        
        .whereLayer("Controller").mayNotBeAccessedByAnyLayer()
        .whereLayer("Service").mayOnlyBeAccessedByLayers("Controller")
        .whereLayer("Repository").mayOnlyBeAccessedByLayers("Service");

    /**
     * Prevents dependencies on other microservices to maintain bounded context integrity.
     */
    @ArchTest
    static final ArchRule department_service_bounded_context_isolation =
        noClasses()
            .that().resideInAPackage("nl.saxion.disaster.departmentservice..")
            .should().dependOnClassesThat()
            .resideInAnyPackage(
                "nl.saxion.disaster.chat_service..",
                "nl.saxion.disaster.incident_service..",
                "nl.saxion.disaster.user_service..",
                "nl.saxion.disaster.notification_service..",
                "nl.saxion.disaster.regionservice..",
                "nl.saxion.disaster.resourceservice..",
                "nl.saxion.disaster.municipality_service..",
                "nl.saxion.disaster.deploymentservice.."
            )
            .because("Department Service is a bounded context and must not depend on other services' models");

    /**
     * DTOs should not appear in repository or model layers.
     */
    @ArchTest
    static final ArchRule dtos_should_not_be_in_repository_or_model =
        noClasses()
            .that().resideInAPackage("..repository..")
            .or().resideInAPackage("..model..")
            .should().dependOnClassesThat().resideInAPackage("..dto..");

    /**
     * Controllers must use services, not repositories directly.
     */
    @ArchTest
    static final ArchRule controllers_should_not_access_repositories =
        noClasses()
            .that().resideInAPackage("..controller..")
            .should().dependOnClassesThat().resideInAPackage("..repository..");

    /**
     * Feign clients should only be used in the service layer.
     */
    @ArchTest
    static final ArchRule feign_clients_only_in_services =
        noClasses()
            .that().resideInAPackage("..controller..")
            .or().resideInAPackage("..repository..")
            .should().dependOnClassesThat().resideInAPackage("..client..");
}
