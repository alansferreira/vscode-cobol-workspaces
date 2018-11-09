


declare module 'cobol-parsers' {
    export const copybook: CopybookParser;
    export const program: ProgramParser;
    export const jcl: JCLParser;
    
    export interface JCLParser{
        parseJob(content: string): ParsedJob;
        extractReferences(parseJob: ParsedJob): JobReference;
    }

    export interface ParsedJob{
        statements: JobParsedStatement[];
    }
    export interface JobReference {
        
        job?: JobReferenceItem[];
        dd?: JobReferenceItem[];
        program?: JobReferenceItem[];

    }
    export interface JobReferenceItem{
        type: 'job' | 'dd' | 'program';
        reference: JobReferenceSpec;
        startedAtLine: number;
    }    
    export interface JobReferenceSpec{
        jobName?: string;
        programerName?: string;
        datasetName?: string;
        program?: string;

    }
    export interface JobParsedStatement {
        STMT_TYPE: string;
        startedAtLine: number;
        endedAtLine: number;
        labelName?: string;
        command?: string;
        commandArgs?: string;
        args?: any[];
        jobName?: string;
        programerName?: string;
        datasetName?: string;
        program?: string;
    }


    export interface ProgramParser{
        parseProgram(content: string): ParsedProgram;
        extractReferences(parseJob: ParsedProgram): ProgramReference;
    }


    export interface ParsedProgram{
        divisions?: ProgramParsedStatement[];
        statements: ProgramParsedStatement[];
    }
    export interface ProgramParsedStatement {
        name: string;
        startedAtLine: number;
        endedAtLine: number;

        STMT_TYPE: 'FILE_CONTROL' | 'DIVISION' | 'SECTION' | 'COPY' | 'EXEC_CICS' | 'EXEC_SQL' | 'CALL_PROGRAM';

        divisions?: ProgramParsedStatement[];
        sections?: ProgramParsedStatement[];
        statements?: ProgramParsedStatement[];
        
        isDivision?: string;

        hardCodeCopySource?: string;
        variableCopySource?: string;

        hardCodeProgramName?: string;
        variableProgramName?: string;
        usingData?: string;

        sqlStatement?: string;
        programName?: string;
    }

    export interface ProgramReference {
        copybook?: ProgramReferenceItem[];
        query?: ProgramReferenceItem[];
        cics?: ProgramReferenceItem[];

    }

    export interface ProgramReferenceItem{
        type: string;
        startedAtLine: number;
        reference: ProgramReferenceItemSpec;
    }
    export interface ProgramReferenceItemSpec{
        fileName?: string;
        query?: string;
        programName?: string;
    }




    export interface CopybookParser{
        loadBook(content: string): CopybookParsedStatement[];
    }


    export interface CopybookParsedStatement {
        src?: string;
        type?: string;
        logicalLevel?: number;
        name?: string;
        size?: number;
        default_value?: string;
        occurs_min?: number;
        occurs_max?: number;
        has_compression?: boolean;
        compression_level?: number;
        fields?: CopybookParsedStatement[]
    }

    export interface CopybookReference {
        copybook?: CopybookReferenceItem[];
    }

    export interface CopybookReferenceItem{
        type: string;
        startedAtLine: number;
        reference: CopybookReferenceItemSpec;
    }
    export interface CopybookReferenceItemSpec{
        fileName?: string;
    }
} 
